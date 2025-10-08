package io.openaev.opencti.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Data
public class OpenCTIConfig {
  public static final String GRAPHQL_ENDPOINT_URI = "graphql";

  @NotNull
  @Value("${openbas.xtm.opencti.enable:${openaev.xtm.opencti.enable:false}}")
  private Boolean enable;

  @NotBlank
  @Value("${openbas.xtm.opencti.url:${openaev.xtm.opencti.url:#{null}}}")
  private String url;

  @Value("${openbas.xtm.opencti.api-url:${openaev.xtm.opencti.api-url:#{null}}}")
  private String apiUrl;

  @NotBlank
  @Value("${openbas.xtm.opencti.token:${openaev.xtm.opencti.token:#{null}}}")
  private String token;

  public String getApiUrl() {
    String urlStripped = StringUtils.stripEnd(url, "/");
    return (apiUrl != null && !apiUrl.isBlank())
        ? apiUrl
        : String.join("/", List.of(urlStripped, GRAPHQL_ENDPOINT_URI));
  }
}
