import os
import re
from urllib.parse import urlparse, parse_qs

import requests
import streamlit as st
import streamlit.components.v1 as components

DEFAULT_API_BASE = os.getenv("API_BASE") or "http://localhost:5000"

stored_api_base = st.session_state.get("api_base")
if not stored_api_base or stored_api_base in {"http://localhost:8000", "http://127.0.0.1:8000", "http://localhost", "http://127.0.0.1"}:
    API_BASE = DEFAULT_API_BASE
else:
    API_BASE = stored_api_base

st.session_state["api_base"] = API_BASE
API_API_BASE = API_BASE.rstrip('/') + '/api'

THREAD_API = f"{API_API_BASE}/threads"
UPLOAD_API = f"{API_API_BASE}/upload"

st.title("Forum and Rich Text Editor")
st.write("Create threads, reply with formatted content, upload images, and embed media.")

if st.button("Check backend health"):
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        st.success(response.json())
    except Exception as exc:
        st.error(f"Unable to reach backend: {exc}")

st.markdown(f"**Backend API base URL:** `{API_BASE}`")

if "selected_thread" not in st.session_state:
    st.session_state.selected_thread = None
if "embed_urls" not in st.session_state:
    st.session_state.embed_urls = []


def parse_markdown_formatting(text):
    formatting = {
        "bold": [],
        "italic": [],
        "codeBlocks": []
    }

    for match in re.finditer(r"\*\*(.+?)\*\*", text):
        formatting["bold"].append({"start": match.start(1), "end": match.end(1)})

    for match in re.finditer(r"_(.+?)_", text):
        formatting["italic"].append({"start": match.start(1), "end": match.end(1)})

    for match in re.finditer(r"```(\w*)\n([\s\S]*?)\n```", text):
        language = match.group(1) or ""
        formatting["codeBlocks"].append({
            "start": match.start(2),
            "end": match.end(2),
            "language": language
        })

    return formatting


def normalize_embed(url):
    parsed = urlparse(url)
    if not parsed.scheme:
        return None
    if "youtube" in url or "youtu.be" in url:
        return "youtube"
    if url.endswith(".pdf"):
        return "pdf"
    if any(url.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".gif", ".webp"]):
        return "image"
    return "link"


def build_rich_content(text, embed_list):
    return {
        "text": text,
        "formatting": parse_markdown_formatting(text),
        "embeds": embed_list
    }


def render_embeds(embeds):
    for embed in embeds:
        if embed["type"] == "image":
            st.image(embed["url"], caption=embed.get("title", "Uploaded image"), use_column_width=True)
        elif embed["type"] == "youtube":
            video_id = None
            if "youtu.be" in embed["url"]:
                video_id = urlparse(embed["url"]).path.lstrip("/")
            else:
                qs = parse_qs(urlparse(embed["url"]).query)
                video_id = qs.get("v", [None])[0]
            if video_id:
                components.html(
                    f"<iframe width='100%' height='315' src='https://www.youtube.com/embed/{video_id}' frameborder='0' allowfullscreen></iframe>",
                    height=340
                )
            else:
                st.markdown(f"[YouTube Video]({embed['url']})")
        elif embed["type"] == "pdf":
            components.html(
                f"<iframe src='{embed['url']}' width='100%' height='600px'></iframe>",
                height=620
            )
        elif embed["type"] == "link":
            st.markdown(f"[{embed.get('title', embed['url'])}]({embed['url']})")


def create_thread(title, content, author):
    payload = {
        "title": title,
        "content": content,
        "author": author
    }
    response = requests.post(THREAD_API, json=payload)
    response.raise_for_status()
    return response.json()


def create_reply(thread_id, content, author, rich_content):
    response = requests.post(f"{API_API_BASE}/{thread_id}/replies", json={
        "content": content,
        "author": author,
        "richContent": rich_content
    })
    response.raise_for_status()
    return response.json()


def upload_file(file):
    files = {"file": (file.name, file.getvalue(), file.type)}
    response = requests.post(UPLOAD_API, files=files)
    response.raise_for_status()
    return response.json().get("url")


def get_threads():
    response = requests.get(THREAD_API)
    response.raise_for_status()
    return response.json().get("threads", [])


def get_thread(thread_id):
    response = requests.get(f"{THREAD_API}/{thread_id}")
    response.raise_for_status()
    return response.json()


def get_replies(thread_id):
    response = requests.get(f"{API_BASE}/{thread_id}/replies")
    response.raise_for_status()
    return response.json().get("replies", [])


st.sidebar.header("Create a New Thread")
with st.sidebar.form("thread_form"):
    new_title = st.text_input("Thread title")
    new_author = st.text_input("Your name")
    new_content = st.text_area("Thread content", height=180)
    submit_thread = st.form_submit_button("Create thread")

if submit_thread:
    try:
        if not new_title or not new_content or not new_author:
            st.error("Title, content, and author are required.")
        else:
            create_thread(new_title, new_content, new_author)
            st.success("Thread created successfully.")
            st.session_state.selected_thread = None
    except Exception as exc:
        st.error(f"Failed to create thread: {exc}")

st.sidebar.markdown("---")
with st.sidebar.expander("Embed URLs"):
    embed_url = st.text_input("Embed URL (YouTube, PDF, image, or link)")
    embed_title = st.text_input("Embed title (optional)")
    if st.button("Add embed"):
        if embed_url:
            embed_type = normalize_embed(embed_url)
            if embed_type == "link":
                st.warning("Only image, PDF, and YouTube embeds are supported for preview. Link will still be saved.")
            st.session_state.embed_urls.append({"type": embed_type, "url": embed_url, "title": embed_title})
            st.experimental_rerun()

if st.session_state.embed_urls:
    st.sidebar.write("### Added embeds")
    for idx, embed in enumerate(st.session_state.embed_urls):
        st.sidebar.write(f"- {embed['type']}: {embed['url']}")
    if st.sidebar.button("Clear embeds"):
        st.session_state.embed_urls = []
        st.experimental_rerun()

st.sidebar.markdown("---")
with st.sidebar.expander("Upload an image"):
    uploaded_file = st.file_uploader("Choose an image to upload", type=["png", "jpg", "jpeg", "gif", "webp"])
    if uploaded_file is not None:
        try:
            file_url = upload_file(uploaded_file)
            st.success("Image uploaded successfully.")
            st.write(file_url)
            st.session_state.embed_urls.append({"type": "image", "url": file_url, "title": uploaded_file.name})
        except Exception as exc:
            st.error(f"Upload failed: {exc}")

st.sidebar.markdown("---")

threads = []
try:
    threads = get_threads()
except Exception as exc:
    st.error(f"Unable to load threads: {exc}")

st.header("Thread Feed")
if not threads:
    st.info("No threads available. Create a new thread from the sidebar.")

for thread in threads:
    thread_key = f"thread-{thread['id']}"
    if st.button(thread['title'], key=thread_key):
        st.session_state.selected_thread = thread['id']

if st.session_state.selected_thread:
    try:
        thread = get_thread(st.session_state.selected_thread)
        st.subheader(thread["title"])
        st.markdown(f"**Author:** {thread['author']}  \n**Replies:** {thread['replyCount']}  \n**Created:** {thread['createdAt']}")
        st.markdown(thread['content'], unsafe_allow_html=True)

        replies = get_replies(thread['id'])
        st.write("---")
        st.subheader("Replies")
        if not replies:
            st.info("No replies yet. Be the first to reply.")

        for reply in replies:
            st.markdown(f"**{reply['author']}**  \n{reply['createdAt']}")
            st.markdown(reply['content'], unsafe_allow_html=True)
            if reply.get('richContent'):
                render_embeds(reply['richContent'].get('embeds', []))
            st.write("---")

        with st.form("reply_form"):
            reply_author = st.text_input("Your name", key="reply_author")
            reply_content = st.text_area("Reply content", height=160, key="reply_content")
            if st.session_state.embed_urls:
                st.write("Current embeds:")
                for embed in st.session_state.embed_urls:
                    st.write(f"- {embed['type']}: {embed['url']}")
            submit_reply = st.form_submit_button("Post reply")
            if submit_reply:
                try:
                    if not reply_author or not reply_content:
                        st.error("Author and reply content are required.")
                    else:
                        rich_content = build_rich_content(reply_content, st.session_state.embed_urls)
                        create_reply(thread['id'], reply_content, reply_author, rich_content)
                        st.success("Reply posted successfully.")
                        st.session_state.embed_urls = []
                        st.experimental_rerun()
                except Exception as exc:
                    st.error(f"Failed to post reply: {exc}")
    except Exception as exc:
        st.error(f"Unable to load thread: {exc}")
