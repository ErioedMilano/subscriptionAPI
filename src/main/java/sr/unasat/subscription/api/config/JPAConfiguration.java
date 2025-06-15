package sr.unasat.subscription.api.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public class JPAConfiguration {
    private static final EntityManagerFactory entityManagerFactory =
            Persistence.createEntityManagerFactory("unasat");

    public static EntityManager getEntityManager() {
        return entityManagerFactory.createEntityManager();
    }
}
