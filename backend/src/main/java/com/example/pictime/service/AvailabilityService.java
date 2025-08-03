package com.example.pictime.service;

import com.example.pictime.entity.Availability;
import com.example.pictime.repository.AvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AvailabilityService {
    @Autowired
    private AvailabilityRepository availabilityRepository;

    public List<Availability> findByEventId(String eventId) {
        return availabilityRepository.findByEventId(eventId);
    }
    public Availability save(Availability availability) {
        return availabilityRepository.save(availability);
    }
    public boolean existsByEventIdAndParticipantName(String eventId, String participantName) {
        return availabilityRepository.existsByEventIdAndParticipantName(eventId, participantName);
    }
}
