package vn.team05.webfastfood.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.team05.webfastfood.model.User;
import vn.team05.webfastfood.repository.UserRepository;
@Service
public class CustomUserDetailService implements UserDetailsService {
    @Autowired
    UserRepository userRepo;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
        User account = userRepo.findByPhone(phone)
                .orElseThrow (() ->
                        new UsernameNotFoundException("Not found account with username: " + phone));

        return UserPrincipal.create(account);
    }

    @Transactional
    public UserDetails loadUserById(Long id) {
        User account = userRepo.findById(id).orElseThrow(
                () -> new UsernameNotFoundException("User not found with id " + id));
        return UserPrincipal.create(account);
    }

}
