FROM jenkins/jenkins:lts-jdk17

ARG COSIGN_VERSION=v2.5.3

USER root

RUN apt-get update \
    && apt-get install -y \
        ca-certificates \
        curl \
        docker.io \
        docker-compose \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL \
        "https://github.com/sigstore/cosign/releases/download/${COSIGN_VERSION}/cosign-linux-amd64" \
        -o /usr/local/bin/cosign \
    && chmod +x /usr/local/bin/cosign \
    && cosign version

USER jenkins
