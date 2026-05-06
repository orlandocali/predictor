package com.app.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.app.dto.MatchDTO;
import com.app.mapper.MatchMapper;
import com.app.repository.MatchRepository;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final MatchMapper matchMapper;

    public MatchService(MatchRepository matchRepository, MatchMapper matchMapper) {
        this.matchRepository = matchRepository;
        this.matchMapper = matchMapper;
    }

    public List<MatchDTO> getAllMatches() {
        return matchRepository.findAll()
                .stream()
                .map(matchMapper::toDTO)
                .toList();
    }
}
