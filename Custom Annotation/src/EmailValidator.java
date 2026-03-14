import java.lang.reflect.Field;

public class EmailValidator {

    public static void validate(Object obj) {

        Field[] fields = obj.getClass().getDeclaredFields();

        for (Field field : fields) {

            if (field.isAnnotationPresent(EmailValidation.class)) {

                field.setAccessible(true);

                try {
                    String value = (String) field.get(obj);

                    if (!value.contains("@") || !value.contains(".")) {
                        System.out.println("Invalid Email Address");
                    } else {
                        System.out.println("Valid Email Address");
                    }

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}