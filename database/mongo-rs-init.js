// Idempotent replica-set init — runs inside the mongo-init container.
// By the time this runs, the RS config in the volume already has
// host = "ecom-java-mongo:27017" (patched during setup).
var targetHost = "ecom-java-mongo:27017";

var status;
try {
  status = db.adminCommand({ replSetGetStatus: 1 });
} catch (e) {
  status = { ok: 0, codeName: e.codeName || "unknown", errmsg: e.message };
}

print("replSetGetStatus result: ok=" + status.ok + " codeName=" + (status.codeName || "n/a"));

if (status.ok === 1) {
  // Already has a primary or secondary — check hostname
  var currentHost = status.members[0].name;
  print("RS already up. Member host: " + currentHost);
  if (currentHost !== targetHost) {
    print("WARNING: member host mismatch — forcing reconfig to " + targetHost);
    var cfg = db.adminCommand({ replSetGetConfig: 1 }).config;
    cfg.members[0].host = targetHost;
    cfg.version += 1;
    print(JSON.stringify(db.adminCommand({ replSetReconfig: cfg, force: true })));
  }
} else if (status.codeName === "NotYetInitialized") {
  print("RS not initialized. Initializing...");
  print(JSON.stringify(db.adminCommand({
    replSetInitiate: { _id: "rs0", members: [{ _id: 0, host: targetHost }] }
  })));
} else {
  // InvalidReplicaSetConfig (93) or similar — RS exists but no primary yet.
  // Config was already patched directly in the volume; just log and let
  // the primary-election loop in the shell script handle it.
  print("RS in transitional state (" + (status.codeName || status.errmsg) + "). Waiting for election...");
}
