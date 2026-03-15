package com.url.shortener.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.jdbc.DataSourceBuilder;
import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl == null || !databaseUrl.startsWith("postgres")) {
            // Fallback to default properties if DATABASE_URL is not provided or not postgres
            return null; 
        }

        try {
            // Render/Heroku DATABASE_URL format: postgres://user:password@host:port/dbname
            URI dbUri = new URI(databaseUrl);
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":")[1];
            
            // Convert to JDBC format: jdbc:postgresql://host:port/dbname?sslmode=require
            String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + dbUri.getPort() + dbUri.getPath() + "?sslmode=require";

            return DataSourceBuilder.create()
                    .url(dbUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        } catch (URISyntaxException | ArrayIndexOutOfBoundsException e) {
            // If parsing fails, fall back to standard Spring Boot datasource properties
            return null;
        }
    }
}
