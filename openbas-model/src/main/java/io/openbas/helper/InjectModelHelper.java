package io.openbas.helper;

import static io.openbas.database.model.Inject.SPEED_STANDARD;
import static java.time.Duration.between;
import static java.time.Instant.now;
import static java.util.Optional.ofNullable;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.StreamSupport;

public class InjectModelHelper {

  private InjectModelHelper() {}

  public static boolean isReady(
      InjectorContract injectorContract,
      ObjectNode content,
      boolean allTeams,
      @NotNull final List<String> teams,
      @NotNull final List<String> assets,
      @NotNull final List<String> assetGroups) {
    if (injectorContract == null) {
      return false;
    }
    if (content == null) {
      return false;
    }
    AtomicBoolean ready = new AtomicBoolean(true);
    ObjectNode contractContent = injectorContract.getConvertedContent();
    List<JsonNode> contractMandatoryFields =
        StreamSupport.stream(contractContent.get("fields").spliterator(), false)
            .filter(
                contractElement ->
                    (contractElement.get("key").asText().equals("assets")
                        || contractElement.get("mandatory").asBoolean()
                        || (contractElement.get("mandatoryGroups") != null
                            && contractElement.get("mandatoryGroups").asBoolean())))
            .toList();
    if (!contractMandatoryFields.isEmpty()) {
      contractMandatoryFields.forEach(
          jsonField -> {
            String key = jsonField.get("key").asText();
            if (key.equals("teams")) {
              if (teams.isEmpty() && !allTeams) {
                ready.set(false);
              }
            } else if (key.equals("assets")) {
              if (assets.isEmpty() && assetGroups.isEmpty()) {
                ready.set(false);
              }
            } else if ((jsonField.get("type").asText().equals("text")
                    || jsonField.get("type").asText().equals("textarea"))
                && content.get(key) == null) {
              ready.set(false);
            } else if ((jsonField.get("type").asText().equals("text")
                    || jsonField.get("type").asText().equals("textarea"))
                && content.get(key).asText().isEmpty()) {
              ready.set(false);
            }
          });
    }
    return ready.get();
  }

  public static Instant computeInjectDate(
      Instant source, int speed, Long dependsDuration, Exercise exercise) {
    // Compute origin execution date
    long duration = ofNullable(dependsDuration).orElse(0L) / speed;
    Instant standardExecutionDate = source.plusSeconds(duration);
    // Compute execution dates with previous terminated pauses
    Instant afterPausesExecutionDate = standardExecutionDate;
    List<Pause> sortedPauses =
        new ArrayList<>(
            exercise.getPauses().stream()
                .sorted(
                    (pause0, pause1) ->
                        pause0.getDate().equals(pause1.getDate())
                            ? 0
                            : pause0.getDate().isBefore(pause1.getDate()) ? -1 : 1)
                .toList());
    long previousPauseDelay = 0L;
    for (Pause pause : sortedPauses) {
      if (pause.getDate().isAfter(afterPausesExecutionDate)) {
        break;
      }
      previousPauseDelay += pause.getDuration().orElse(0L);
      afterPausesExecutionDate = standardExecutionDate.plusSeconds(previousPauseDelay);
    }

    // Add current pause duration in date computation if needed
    long currentPauseDelay;
    Instant finalAfterPausesExecutionDate = afterPausesExecutionDate;
    currentPauseDelay =
        exercise
            .getCurrentPause()
            .filter(pauseTime -> pauseTime.isBefore(finalAfterPausesExecutionDate))
            .map(pauseTime -> between(pauseTime, now()).getSeconds())
            .orElse(0L);
    long globalPauseDelay = previousPauseDelay + currentPauseDelay;
    long minuteAlignModulo = globalPauseDelay % 60;
    long alignedPauseDelay =
        minuteAlignModulo > 0 ? globalPauseDelay + (60 - minuteAlignModulo) : globalPauseDelay;
    return standardExecutionDate.plusSeconds(alignedPauseDelay);
  }

  public static Optional<Instant> getDate(
      Exercise exercise, Scenario scenario, Long dependsDuration) {
    if (exercise == null && scenario == null) {
      return Optional.ofNullable(now().minusSeconds(30));
    }

    if (scenario != null) {
      return Optional.empty();
    }

    if (exercise != null) {
      if (exercise.getStatus().equals(ExerciseStatus.CANCELED)) {
        return Optional.empty();
      }
      return exercise
          .getStart()
          .map(source -> computeInjectDate(source, SPEED_STANDARD, dependsDuration, exercise));
    }
    return Optional.ofNullable(LocalDateTime.now().toInstant(ZoneOffset.UTC));
  }

  public static Instant getSentAt(Optional<InjectStatus> status) {
    if (status.isPresent()) {
      return status.orElseThrow().getTrackingSentDate();
    }
    return null;
  }
}
