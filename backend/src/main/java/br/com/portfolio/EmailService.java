package br.com.portfolio;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class EmailService {
    private final RestClient client;
    private final String apiKey;
    private final String from;
    private final String to;

    public EmailService(RestClient.Builder builder,
            @Value("${portfolio.email.api-key}") String apiKey,
            @Value("${portfolio.email.from}") String from,
            @Value("${portfolio.email.to}") String to) {
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.client = builder.requestFactory(factory).baseUrl("https://api.resend.com").build();
        this.apiKey = apiKey;
        this.from = from;
        this.to = to;
    }

    public boolean configured() {
        return !apiKey.isBlank() && !from.isBlank() && !to.isBlank();
    }

    public void send(ContactRequest request) {
        client.post().uri("/emails")
            .header("Authorization", "Bearer " + apiKey)
            .body(Map.of("from", from, "to", List.of(to), "reply_to", request.email(),
                "subject", "Contato pelo portfólio: " + request.name(),
                "text", "Nome: " + request.name() + "\nE-mail: " + request.email() + "\n\n" + request.message()))
            .retrieve().toBodilessEntity();
    }
}
