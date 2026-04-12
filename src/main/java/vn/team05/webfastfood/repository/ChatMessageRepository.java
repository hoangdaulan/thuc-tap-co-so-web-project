package vn.team05.webfastfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.team05.webfastfood.model.ChatMessage;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @EntityGraph(attributePaths = {"customer", "sender"})
    List<ChatMessage> findByCustomerIdOrderByCreatedAtAsc(Long customerId);

    @EntityGraph(attributePaths = {"customer", "sender"})
    @Query("""
            SELECT cm FROM ChatMessage cm
            WHERE cm.id IN (
                SELECT MAX(innerCm.id)
                FROM ChatMessage innerCm
                GROUP BY innerCm.customer.id
            )
            ORDER BY cm.createdAt DESC
            """)
    List<ChatMessage> findLatestMessagesForEachConversation();
}
