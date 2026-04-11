package vn.team05.webfastfood.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import vn.team05.webfastfood.dto.response.ChatMessageResponse;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ChatRealtimeService {

    private static final long SSE_TIMEOUT_MILLIS = 0L;

    private final Map<Long, List<SseEmitter>> customerEmitters = new ConcurrentHashMap<>();
    private final List<SseEmitter> employeeEmitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribeCustomer(Long customerId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MILLIS);
        customerEmitters.computeIfAbsent(customerId, key -> new CopyOnWriteArrayList<>()).add(emitter);
        registerLifecycle(emitter, customerEmitters.get(customerId));
        sendConnectedEvent(emitter);
        return emitter;
    }

    public SseEmitter subscribeEmployee() {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MILLIS);
        employeeEmitters.add(emitter);
        registerLifecycle(emitter, employeeEmitters);
        sendConnectedEvent(emitter);
        return emitter;
    }

    public void publishMessage(ChatMessageResponse message) {
        broadcast(customerEmitters.get(message.getCustomerId()), "CHAT_MESSAGE", message);
        broadcast(employeeEmitters, "CHAT_MESSAGE", message);
    }

    private void registerLifecycle(SseEmitter emitter, List<SseEmitter> emitters) {
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(error -> emitters.remove(emitter));
    }

    private void sendConnectedEvent(SseEmitter emitter) {
        try {
            emitter.send(SseEmitter.event().name("CONNECTED").data("ok"));
        } catch (IOException ex) {
            emitter.completeWithError(ex);
        }
    }

    private void broadcast(List<SseEmitter> emitters, String eventName, ChatMessageResponse payload) {
        if (emitters == null) {
            return;
        }
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(payload));
            } catch (IOException ex) {
                emitter.complete();
                emitters.remove(emitter);
            }
        }
    }
}
