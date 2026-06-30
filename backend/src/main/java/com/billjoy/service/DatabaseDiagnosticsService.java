package com.billjoy.service;

import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DatabaseDiagnosticsService {

    private final DataSource dataSource;
    private final Environment environment;

    public String activeProfiles() {
        String[] profiles = environment.getActiveProfiles();
        if (profiles.length == 0) {
            profiles = environment.getDefaultProfiles();
        }
        return String.join(",", profiles);
    }

    public String databaseHost() {
        String url = jdbcUrl();
        if (url == null || url.isBlank()) {
            return "unknown";
        }
        return sanitizeJdbcUrl(url);
    }

    public String databaseProductName() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.getMetaData().getDatabaseProductName();
        } catch (SQLException ex) {
            return "unknown";
        }
    }

    public String databaseName() {
        try (Connection connection = dataSource.getConnection()) {
            String catalog = connection.getCatalog();
            return catalog == null || catalog.isBlank() ? "unknown" : catalog;
        } catch (SQLException ex) {
            return "unknown";
        }
    }

    public boolean isConnected() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(5);
        } catch (SQLException ex) {
            return false;
        }
    }

    public List<String> tables() {
        List<String> tables = new ArrayList<>();
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            List<String> tableTypes = Arrays.asList("TABLE");
            try (ResultSet resultSet = metaData.getTables(connection.getCatalog(), null, "%", tableTypes.toArray(String[]::new))) {
                while (resultSet.next()) {
                    tables.add(resultSet.getString("TABLE_NAME"));
                }
            }
        } catch (SQLException ex) {
            tables.add("Unable to read tables: " + ex.getMessage());
        }
        tables.sort(String.CASE_INSENSITIVE_ORDER);
        return tables;
    }

    private String jdbcUrl() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.getMetaData().getURL();
        } catch (SQLException ex) {
            return environment.getProperty("spring.datasource.url", "unknown");
        }
    }

    private String sanitizeJdbcUrl(String jdbcUrl) {
        String withoutJdbcPrefix = jdbcUrl.startsWith("jdbc:") ? jdbcUrl.substring(5) : jdbcUrl;
        try {
            URI uri = URI.create(withoutJdbcPrefix);
            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                return uri.getScheme() != null ? uri.getScheme() : "unknown";
            }
            int port = uri.getPort();
            return port > 0 ? host + ":" + port : host;
        } catch (IllegalArgumentException ex) {
            return withoutJdbcPrefix.replaceAll("(?i)(password=)[^&;]+", "$1****");
        }
    }
}
