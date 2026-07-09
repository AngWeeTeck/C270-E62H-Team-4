import streamlit as st
import requests

API_BASE = st.session_state.get("api_base", "http://localhost:8000")

st.title("Streamlit Frontend")

st.write("## FastAPI backend via Streamlit")

if st.button("Check backend health"):
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=5)
        st.success(response.json())
    except Exception as exc:
        st.error(f"Unable to reach backend: {exc}")

st.markdown(f"**Backend base URL:** `{API_BASE}`")
