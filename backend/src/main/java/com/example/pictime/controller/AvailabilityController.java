package com.example.pictime.controller;

import com.example.pictime.entity.Availability;
import com.example.pictime.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/availability")
@CrossOrigin(origins = "http://localhost:3000")
public class AvailabilityController {
    @Autowired
    private AvailabilityService availabilityService;

    @PostMapping
    public Availability registerAvailability(@PathVariable String eventId, @RequestBody Availability availability) {
        availability.setEventId(eventId);
        return availabilityService.save(availability);
    }

    @GetMapping
    public List<Availability> getAvailabilities(@PathVariable String eventId) {
        return availabilityService.findByEventId(eventId);
    }

    @GetMapping("/check-participant")
    public java.util.Map<String, Boolean> checkParticipant(@PathVariable String eventId, @RequestParam String name) {
        boolean exists = availabilityService.existsByEventIdAndParticipantName(eventId, name);
        return java.util.Map.of("exists", exists);
    }
}
