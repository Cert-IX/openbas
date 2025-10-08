package io.openaev.generator;

import static org.hibernate.generator.EventTypeSets.INSERT_ONLY;

import io.openaev.database.model.Base;
import java.util.EnumSet;
import java.util.UUID;
import lombok.NoArgsConstructor;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.generator.BeforeExecutionGenerator;
import org.hibernate.generator.EventType;

/**
 * A simple UUID generator that also allows for static ID assignment before persisting the entity.
 */
@NoArgsConstructor
public class ControlledUuidGenerator implements BeforeExecutionGenerator {

  @Override
  public EnumSet<EventType> getEventTypes() {
    return INSERT_ONLY;
  }

  @Override
  public boolean allowAssignedIdentifiers() {
    return true;
  }

  @Override
  public Object generate(
      SharedSessionContractImplementor session,
      Object owner,
      Object currentValue,
      EventType eventType) {
    final String id;
    if (owner instanceof Base) {
      id = ((Base) owner).getId();
    } else {
      id = null;
    }

    return id != null ? id : UUID.randomUUID().toString();
  }
}
