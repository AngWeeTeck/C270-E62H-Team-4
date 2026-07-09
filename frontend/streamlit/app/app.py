import os
import streamlit as st
import requests

DEFAULT_API_BASE = os.getenv("API_BASE") or "http://fastapi:8000"

stored_api_base = st.session_state.get("api_base")
if not stored_api_base or stored_api_base in {"http://localhost:8000", "http://127.0.0.1:8000", "http://localhost", "http://127.0.0.1"}:
    API_BASE = DEFAULT_API_BASE
else:
    API_BASE = stored_api_base

st.session_state["api_base"] = API_BASE

st.title("Streamlit Frontend")

st.write("## FastAPI backend via Streamlit")

if st.button("Check backend health"):
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        st.success(response.json())
    except Exception as exc:
        st.error(f"Unable to reach backend: {exc}")

st.markdown(f"**Backend base URL:** `{API_BASE}`")
