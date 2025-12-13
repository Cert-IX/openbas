package io.openaev.annotation;

import static java.lang.annotation.ElementType.FIELD;

import io.openaev.generator.ControlledUuidGenerator;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.hibernate.annotations.IdGeneratorType;

@IdGeneratorType(ControlledUuidGenerator.class)
@Target({FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ControlledUuidGeneration {}
