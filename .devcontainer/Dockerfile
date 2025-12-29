# Dev container image with Microsoft Build of OpenJDK 25 (Ubuntu) and mssql-tools
FROM mcr.microsoft.com/openjdk/jdk:25-ubuntu

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

# create non-root user if not present (base image typically already has vscode user)
RUN if ! id "${USERNAME}" >/dev/null 2>&1; then \
      groupadd --gid ${USER_GID} ${USERNAME} && \
      useradd -s /bin/bash --uid ${USER_UID} --gid ${USER_GID} -m ${USERNAME}; \
    fi

# install tools: maven, curl, sqlcmd prerequisites (maven may already be present)
USER root
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    curl \
    apt-transport-https \
    ca-certificates \
    gnupg \
    unixodbc-dev \
    procps \
  && rm -rf /var/lib/apt/lists/*

# Install Microsoft packages for msodbcsql and mssql-tools (use secure keyring)
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-archive-keyring.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/microsoft-archive-keyring.gpg] https://packages.microsoft.com/ubuntu/22.04/prod jammy main" > /etc/apt/sources.list.d/microsoft-prod.list \
  && apt-get update \
  && ACCEPT_EULA=Y apt-get install -y msodbcsql18 mssql-tools unixodbc-dev \
  && ln -s /opt/mssql-tools/bin/sqlcmd /usr/local/bin/sqlcmd \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="${PATH}:/opt/mssql-tools/bin"

# Ensure workspace path exists and is owned by non-root user
RUN mkdir -p /workspace/backend && chown -R ${USER_UID}:${USER_GID} /workspace || true

USER ${USERNAME}
WORKDIR /workspace/backend
