package sr.unasat.subscription.api.services;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import sr.unasat.subscription.api.config.JPAConfiguration;
import sr.unasat.subscription.api.entity.User;

public class UserService {
    private EntityManager entityManager;

    public UserService() {
        this.entityManager = JPAConfiguration.getEntityManager();
    }

    public User authenticate(String username, String password) {
        TypedQuery<User> query = entityManager.createQuery(
                "SELECT u FROM User u WHERE u.username = :username", User.class);
        query.setParameter("username", username);

        try {
            User user = query.getSingleResult();
            if (user.getPassword().equals(password)) {
                return user;
            }
        } catch (Exception e) {
            // User not found or multiple results
        }
        return null;
    }
}