package com.example.moneymanager.services;

import com.example.moneymanager.models.Goal;
import com.example.moneymanager.repositories.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GoalService {
    @Autowired
    private GoalRepository goalRepository;

    public List<Goal> getAllGoalsByUserId(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    public Optional<Goal> getGoalByIdAndUserId(Long id, Long userId) {
        Optional<Goal> goal = goalRepository.findById(id);
        if (goal.isPresent() && goal.get().getUserId().equals(userId)) {
            return goal;
        }
        return Optional.empty();
    }

    public Goal createGoal(Goal goal) {
        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, Goal updatedGoal, Long userId) {
        Optional<Goal> existingGoal = getGoalByIdAndUserId(id, userId);
        if (existingGoal.isPresent()) {
            Goal goal = existingGoal.get();
            goal.setName(updatedGoal.getName());
            goal.setTargetAmount(updatedGoal.getTargetAmount());
            goal.setCurrentAmount(updatedGoal.getCurrentAmount());
            goal.setTargetDate(updatedGoal.getTargetDate());
            goal.setDescription(updatedGoal.getDescription());
            goal.setIcon(updatedGoal.getIcon());
            return goalRepository.save(goal);
        }
        throw new RuntimeException("Goal not found or access denied");
    }

    public void deleteGoal(Long id, Long userId) {
        Optional<Goal> goal = getGoalByIdAndUserId(id, userId);
        if (goal.isPresent()) {
            goalRepository.deleteById(id);
        } else {
            throw new RuntimeException("Goal not found or access denied");
        }
    }
}