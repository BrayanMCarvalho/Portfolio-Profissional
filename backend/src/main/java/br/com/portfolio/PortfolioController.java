package br.com.portfolio;

import java.io.IOException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;

@RestController
public class PortfolioController {
    private final JsonNode portfolio;

    public PortfolioController(ObjectMapper mapper) throws IOException {
        try (var input = new ClassPathResource("portfolio.json").getInputStream()) {
            portfolio = mapper.readTree(input);
        }
    }

    @GetMapping("/api/portfolio")
    public JsonNode portfolio() { return portfolio; }
}
