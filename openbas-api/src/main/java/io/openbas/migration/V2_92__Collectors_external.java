package io.openbas.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Statement;

@Component
public class V2_92__Collectors_external extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Statement select = context.getConnection().createStatement();
        select.execute("ALTER TABLE collectors ADD collector_external bool default false not null;");
    }
}
