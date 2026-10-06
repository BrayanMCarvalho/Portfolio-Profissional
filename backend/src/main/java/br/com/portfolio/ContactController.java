package br.com.portfolio;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Map;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ContactController {
    private final EmailService email;
    private final ArrayDeque<Instant> attempts = new ArrayDeque<>();

    public ContactController(EmailService email) { this.email = email; }

    @GetMapping("/health")
    public Map<String, String> health() { return Map.of("status", "UP"); }

    @GetMapping("/contact/status")
    public Map<String, Boolean> status() { return Map.of("available", email.configured()); }

    @PostMapping("/contact")
    public Map<String, String> contact(@Valid @RequestBody ContactRequest request) {
        if (request.website() != null && !request.website().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        if (!email.configured()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE);
        if (!reserveAttempt()) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS);
        try {
            email.send(request);
            return Map.of("status", "sent");
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY);
        }
    }

    // Limite global por instância, sem confiar em cabeçalhos de IP fornecidos pelo cliente.
    private synchronized boolean reserveAttempt() {
        Instant now = Instant.now();
        while (!attempts.isEmpty() && attempts.peekFirst().isBefore(now.minusSeconds(60))) attempts.removeFirst();
        if (attempts.size() >= 5) return false;
        attempts.addLast(now);
        return true;
    }
}
