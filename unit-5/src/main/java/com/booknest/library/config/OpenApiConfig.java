package com.booknest.library.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI bookNestOpenApi() {
        return new OpenAPI().info(new Info()
                .title("BookNest Library API")
                .version("1.0.0")
                .description("REST API for managing books, stock and issue/return in the BookNest library.")
                .contact(new Contact().name("BookNest Team")));
    }
}
