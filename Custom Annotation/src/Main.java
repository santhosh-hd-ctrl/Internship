public class Main {

    public static void main(String[] args) {

        User user1 = new User("santhosh@gmail.com");
        User user2 = new User("santhoshgmail.com");

        EmailValidator.validate(user1);
        EmailValidator.validate(user2);
    }
}