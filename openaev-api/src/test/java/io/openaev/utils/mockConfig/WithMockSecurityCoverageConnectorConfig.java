package io.openaev.utils.mockConfig;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import org.springframework.boot.test.autoconfigure.properties.PropertyMapping;

@Retention(RetentionPolicy.RUNTIME)
@PropertyMapping("openaev.xtm.opencti.connector.security-coverage")
public @interface WithMockSecurityCoverageConnectorConfig {
  String url() default "";

  String authToken() default "";

  String id() default "";

  String listenCallbackURI() default "";
}
