package com.example.pictime.repository;

import com.example.pictime.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<Availability, String> {
    List<Availability> findByEventId(String eventId);
    boolean existsByEventIdAndParticipantName(String eventId, String participantName);
}
