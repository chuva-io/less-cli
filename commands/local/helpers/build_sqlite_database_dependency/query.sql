CREATE TABLE topics_processors_queues (
  id VARCHAR(100) NOT NULL,
  topic VARCHAR(500) NOT NULL,
  processor VARCHAR(500) NOT NULL,
  message JSON NOT NULL,
  retrying BOOLEAN NOT NULL,
  times_retried INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE key_value_storage (
  id VARCHAR(500) NOT NULL,
  value JSON NOT NULL,
  ttl DATE NULL,
  PRIMARY KEY(id)
);
