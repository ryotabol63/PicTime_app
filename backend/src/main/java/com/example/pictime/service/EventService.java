package com.example.pictime.service;

import com.example.pictime.entity.Event;
import com.example.pictime.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;

    public Optional<Event> findById(String id) {
        return eventRepository.findById(id);
    }
    public Event save(Event event) {
        return eventRepository.save(event);
    }
}
