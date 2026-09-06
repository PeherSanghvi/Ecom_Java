#!/bin/bash
# Idempotent replica-set init script.
# Initializes the replica set if not yet done, waits for primary.

TARGET_HOST="ecom-java-mongo:27017"

echo "==> Waiting for MongoDB to be ready at ${TARGET_HOST}..."
for i in $(seq 1 10); do
  if mongosh --host "${TARGET_HOST}" --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q 1; then
    echo "    MongoDB is up."
    break
  fi
  echo "    Attempt ${i}: not ready yet, retrying..."
  sleep 3
done

echo "==> Configuring replica set..."
mongosh --host "${TARGET_HOST}" /mongo-rs-init.js

echo "==> Waiting for primary election..."
for i in $(seq 1 20); do
  ROLE=$(mongosh --host "${TARGET_HOST}" --quiet --eval "try { print(db.adminCommand({ isMaster: 1 }).ismaster); } catch(e) { print(false); }" 2>/dev/null | tail -1)
  echo "    Attempt ${i}: isPrimary=${ROLE}"
  if [ "${ROLE}" = "true" ]; then
    echo "==> Primary is ready!"
    exit 0
  fi
  sleep 3
done

echo "==> ERROR: Timed out waiting for primary"
exit 1
