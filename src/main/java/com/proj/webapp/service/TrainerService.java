package com.proj.webapp.service;

import com.proj.webapp.model.Trainer;
import com.proj.webapp.repo.TrainerRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@RequiredArgsConstructor
@Validated
@Transactional
public class TrainerService
{

    private final TrainerRepo trainerRepo;

    public Trainer create(@Valid @NotNull Trainer newTrainer)
    {
        if (newTrainer.getPeId() != null)
        {
            throw new IllegalArgumentException("peId should not be set");
        }
        if (trainerRepo.existsByPersonalCode(newTrainer.getPersonalCode()))
        {
            throw new IllegalArgumentException("A person with such a personal code already exists");
        }
        return trainerRepo.save(newTrainer);
    }

    @Transactional(readOnly = true)
    public Trainer getById(@NotNull Long id)
    {
        return trainerRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Trainer with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public List<Trainer> listAll()
    {
        return trainerRepo.findAll();
    }

    public Trainer update(@NotNull Long id, @Valid @NotNull Trainer editedTrainer)
    {
        var existing = trainerRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Trainer with id " + id + " not found"));

        existing.setName(editedTrainer.getName());
        existing.setSurname(editedTrainer.getSurname());
        existing.setEmail(editedTrainer.getEmail());
        if (editedTrainer.getJoinedOn() != null)
        {
            existing.setJoinedOn(editedTrainer.getJoinedOn());
        }
        existing.setActivity(editedTrainer.getActivity());

        return existing;
    }

    public void delete(@NotNull Long id)
    {
        if (!trainerRepo.existsById(id))
        {
            throw new IllegalArgumentException("Trainer with id " + id + " not found");
        }
        trainerRepo.deleteById(id);
    }
}
