# Zero-Downtime Deploy — Build Runbook

Your part: **blue-green zero-downtime deployment** + **Ansible staging → production**.
Follow these phases in order. Each one ends with something you can see working.

Files in this kit:
- `app.py`, `requirements.txt`, `Dockerfile` — a tiny stand-in app so you can test
  today. Swap in the group's real image later (just change `image_repo` in `deploy.yml`).
- `deploy.yml` — the blue-green playbook (the engine).
- `templates/nginx-upstream.conf.j2` — the Nginx config Ansible rewrites each deploy.
- `inventory.ini` — your staging + production targets.

---

## Phase 0 — Infra (do this first)

You need:
1. **A target VM** running Ubuntu with Docker installed. One VM is enough to start.
   (An AWS EC2 t2.micro works, or any Ubuntu box you can SSH into.)
   On the VM: `curl -fsSL https://get.docker.com | sh` then `sudo usermod -aG docker $USER`.
2. **Ansible on your control machine** (laptop / Codespace):
   `pip install ansible` (or `sudo apt install ansible`).
3. **SSH access** from control machine → VM using a key (not a password).

Put the VM's IP in `inventory.ini` under `[staging]`, then test the connection:

```bash
ansible -i inventory.ini staging -m ping
```

You want `SUCCESS => {"ping": "pong"}`. Don't move on until you get it.

---

## Phase 1 — Build the app image and push it

From the kit folder, log in and push two versions so you can see the switch later.
Replace `thihan21` with your Docker Hub username if different.

```bash
docker login

docker build --build-arg APP_VERSION=v1 -t thihan21/myapp:v1 .
docker push thihan21/myapp:v1

docker build --build-arg APP_VERSION=v2 -t thihan21/myapp:v2 .
docker push thihan21/myapp:v2
```

---

## Phase 2 — First blue-green deploy to staging

```bash
ansible-playbook -i inventory.ini deploy.yml --limit staging -e image_tag=v1
```

Then open `http://<staging-ip>/` in a browser — you should see "version v1".
Behind the scenes: Nginx is up, `myapp-blue` is live and serving.

### Prove it's zero-downtime (this is your demo)

In one terminal, start a request loop against staging:

```bash
while true; do curl -s -o /dev/null -w "%{http_code} " http://<staging-ip>/; sleep 0.2; done
```

In another terminal, deploy v2:

```bash
ansible-playbook -i inventory.ini deploy.yml --limit staging -e image_tag=v2
```

Watch the first terminal: an unbroken stream of `200 200 200 ...` while the version
flips from v1 to v2. That uninterrupted stream = zero downtime, proven live.
Confirm the swap with `docker ps` on the VM — `myapp-green` is now up, `myapp-blue` is gone.

---

## Phase 3 — Add production and promote

Add your second VM under `[production]` in `inventory.ini`, then:

```bash
# deploy + test on staging
ansible-playbook -i inventory.ini deploy.yml --limit staging -e image_tag=v2

# happy with staging? promote the SAME tag to production
ansible-playbook -i inventory.ini deploy.yml --limit production -e image_tag=v2
```

Same playbook, same image, different `--limit`. You never rebuild — you promote the
exact artifact that passed staging. That is the whole "staging → production" story.

> Only have one VM? Get Phase 2 working perfectly (that's the star feature), and
> present the promotion as "the same command with `--limit production`" — grab a
> second small VM just before the finals if you can.

---

## Phase 4 — Finals demo checklist

1. Show `http://staging/` on v1.
2. Start the curl loop.
3. Run the deploy to v2 live.
4. Point at the unbroken `200`s as the version flips — say the line:
   "no request was ever dropped."
5. `docker ps` before/after to show blue → green.
6. Then show the promotion command to production.

---

## Where your part fits in the group pipeline

Your stage runs on the CD side, **after Janelle's Pre-Deploy Verification Gate**.
Her gate verifies the image is trustworthy, then calls your `deploy.yml`.
Your colour marker (`/etc/myapp/active_color`) is what the **Automatic Rollback**
teammate builds on — tell them how you track the live colour.

## Quick troubleshooting

- `ansible ping` fails → SSH/key issue. Test plain `ssh ubuntu@<ip>` first.
- Playbook can't run docker → user not in the `docker` group on the VM (re-login after `usermod`).
- Health check keeps retrying then fails → the app isn't listening on `app_internal_port`
  (5000 here). Check `docker logs myapp-<colour>` on the VM.
- Browser shows 502 → Nginx is up but the backend colour isn't healthy yet.
