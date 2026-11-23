import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple


def calculate_abnormal_returns(
    stock_returns: pd.Series,
    benchmark_returns: pd.Series
) -> pd.Series:
    """
    Computes abnormal returns AR_t = R_stock,t - R_benchmark,t
    """
    aligned = pd.concat([stock_returns, benchmark_returns], axis=1).dropna()
    aligned.columns = ["stock", "benchmark"]
    return aligned["stock"] - aligned["benchmark"]


def calculate_car(
    stock_prices: pd.Series,
    benchmark_prices: pd.Series,
    event_idx: int,
    windows: List[Tuple[int, int]] = [(0, 1), (0, 5), (0, 20)]
) -> Dict[str, float]:
    """
    Computes Cumulative Abnormal Returns (CAR) across specified event windows.
    Returns: dict of window name -> CAR percentage (e.g. {"CAR[0,+1]": -2.4, ...})
    """
    stock_ret = stock_prices.pct_change()
    bench_ret = benchmark_prices.pct_change()

    ar = calculate_abnormal_returns(stock_ret, bench_ret)

    results = {}
    n = len(ar)

    for start_offset, end_offset in windows:
        w_start = event_idx + start_offset
        w_end = min(event_idx + end_offset + 1, n)

        if w_start < n and w_start < w_end:
            window_ar = ar.iloc[w_start:w_end]
            car_val = float(window_ar.sum() * 100)
            results[f"CAR[{start_offset:+d},{end_offset:+d}]"] = round(car_val, 2)
        else:
            results[f"CAR[{start_offset:+d},{end_offset:+d}]"] = 0.0

    return results


def evaluate_directional_hit(
    predicted_score: float,
    realized_car: float,
    threshold: float = 0.5
) -> bool:
    """
    Tests whether the predicted direction (+ / -) matches realized cumulative abnormal return.
    If both positive or both negative, returns True.
    If predicted neutral (|score| < threshold), considered hit if realized |car| is small (< 1.5%).
    """
    if abs(predicted_score) < threshold:
        return abs(realized_car) < 1.5

    if predicted_score > 0 and realized_car > 0:
        return True
    if predicted_score < 0 and realized_car < 0:
        return True

    return False
