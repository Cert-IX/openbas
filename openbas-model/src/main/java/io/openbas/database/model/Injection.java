package io.openbas.database.model;

import java.time.Instant;
import java.util.Optional;

public interface Injection {
  String getId();

  Exercise getExercise();

  Optional<Instant> getDate();

  Inject getInject();
}
