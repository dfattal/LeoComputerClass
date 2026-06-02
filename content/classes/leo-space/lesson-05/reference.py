# reference.py — answer key for leo-space/lesson-05 (Off the Pad).
#
# INERT: never served or built. Used only by `npm run validate-class leo-space`
# to check tests.json values and to run the teaching graph against a real
# solution (the viz now builds the burn curve from mass_after by name).

import math

G = 6.674e-11


def rocket_dv(v_exhaust, m_full, m_empty):
    return v_exhaust * math.log(m_full / m_empty)


def mass_after(m0, burn_rate, t):
    return m0 - burn_rate * t


def burn_sim(m_full, m_empty, v_exhaust, burn_rate, dt):
    m = m_full
    v = 0.0
    while m > m_empty:
        a = v_exhaust * burn_rate / m
        v = v + a * dt
        m = m - burn_rate * dt
    return v
