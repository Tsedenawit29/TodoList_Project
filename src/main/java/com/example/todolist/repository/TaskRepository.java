// src/main/java/com/example/todolist/repository/TaskRepository.java
package com.example.todolist.repository;

import com.example.todolist.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCompleted(boolean completed);
    List<Task> findByDeadlineBeforeAndCompletedFalse(LocalDate date);
}