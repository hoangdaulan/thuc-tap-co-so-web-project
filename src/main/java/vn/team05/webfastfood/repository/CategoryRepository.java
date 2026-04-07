package vn.team05.webfastfood.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.team05.webfastfood.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
