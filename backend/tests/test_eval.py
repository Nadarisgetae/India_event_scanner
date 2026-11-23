import pytest
import pandas as pd
import numpy as np
from app.eval.event_study import calculate_abnormal_returns, calculate_car, evaluate_directional_hit
from app.eval.run_backtest import run_historical_backtest

def test_abnormal_returns_calculation():
    stock = pd.Series([0.02, -0.01, 0.03, -0.02])
    bench = pd.Series([0.01, -0.02, 0.01, 0.00])
    ar = calculate_abnormal_returns(stock, bench)
    assert len(ar) == 4
    assert round(ar.iloc[0], 4) == 0.01
    assert round(ar.iloc[1], 4) == 0.01

def test_car_calculation_windows():
    dates = pd.date_range("2024-01-01", periods=30, freq="B")
    stock_p = pd.Series(100.0 * np.cumprod(1 + np.full(30, 0.01)), index=dates)
    bench_p = pd.Series(100.0 * np.cumprod(1 + np.full(30, 0.005)), index=dates)

    cars = calculate_car(stock_p, bench_p, event_idx=5, windows=[(0, 1), (0, 5)])
    assert "CAR[+0,+1]" in cars
    assert "CAR[+0,+5]" in cars
    assert cars["CAR[+0,+1]"] > 0

def test_directional_hit_evaluation():
    assert evaluate_directional_hit(predicted_score=-3.5, realized_car=-2.1) is True
    assert evaluate_directional_hit(predicted_score=2.8, realized_car=4.5) is True
    assert evaluate_directional_hit(predicted_score=-4.0, realized_car=3.0) is False

@pytest.mark.asyncio
async def test_historical_backtest_execution():
    res = await run_historical_backtest()
    assert res["total_events"] >= 35
    assert res["accuracy_pct"] >= 70.0
    assert "metrics_file" in res
