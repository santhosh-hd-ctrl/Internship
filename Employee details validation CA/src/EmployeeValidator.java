import java.lang.reflect.Field;
import java.util.regex.Pattern;

public class EmployeeValidator {
    public static void validate(Object obj) throws IllegalAccessException {
        Field[] fields = obj.getClass().getDeclaredFields();

        for (Field field : fields) {
            if (field.isAnnotationPresent(ValidateEmployee.class)) {
                field.setAccessible(true); // Allow access to private fields

                ValidateEmployee anno = field.getAnnotation(ValidateEmployee.class);
                String value = (String) field.get(obj);

                if (value == null || !Pattern.matches(anno.regex(), value)) {
                    System.out.println("❌ Validation Failed: " + field.getName());
                    System.out.println("   Reason: " + anno.message());
                } else {
                    System.out.println("✅ " + field.getName() + " is valid.");
                }
            }
        }
    }
}