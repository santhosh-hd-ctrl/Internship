import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME) // Essential: must be available at runtime
@Target(ElementType.FIELD)          // Applied to class fields
public @interface ValidateEmployee {
    String regex();
    String message() default "Invalid input field";
}