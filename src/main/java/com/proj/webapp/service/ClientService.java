package com.proj.webapp.service;

import com.proj.webapp.model.Client;
import com.proj.webapp.repo.ClientRepo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@RequiredArgsConstructor
@Validated
@Transactional
public class ClientService
{
    private final ClientRepo clientRepo;

    public Client create(@Valid @NotNull Client newClient)
    {
        if (newClient.getPeId() != null) throw new IllegalArgumentException("peId should not be set");

        if (clientRepo.existsByPersonalCode(newClient.getPersonalCode())) throw new IllegalArgumentException("A person with such a personal code already exists");

        return clientRepo.save(newClient);
    }

    @Transactional(readOnly = true)
    public Client getById(@NotNull Long id) {
        return clientRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Client with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public List<Client> listAll() {
        return clientRepo.findAll();
    }


    public Client update(@NotNull Long id, @Valid @NotNull Client editedClient)
    {
        var oldClient = clientRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Client with id " + id + " not found"));

        oldClient.setName(editedClient.getName());
        oldClient.setSurname(editedClient.getSurname());
        oldClient.setEmail(editedClient.getEmail());
        oldClient.setJoinedOn(editedClient.getJoinedOn());

        return oldClient;

    }

    public void delete(@NotNull Long id)
    {
        if (!clientRepo.existsById(id)) throw new IllegalArgumentException("Client with id " + id + " not found");
        clientRepo.deleteById(id);
    }

}
