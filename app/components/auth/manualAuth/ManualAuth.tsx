import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validatePassword } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signUp } from "@/actions/auth.actions";

export enum ManualAuthAction {
  SIGNIN,
  REGISTER,
}

interface ManualAuthProps {
  action: ManualAuthAction;
  onAuthActionChange: (action: ManualAuthAction) => void;
}

export const ManualAuth = ({ action, onAuthActionChange }: ManualAuthProps) => {
  const router = useRouter();
  const isRegister = action === ManualAuthAction.REGISTER;
  const formSchema = z
    .object({
      email: z.union([z.email("Invalid email address"), z.literal("")]),

      password: z.string().superRefine((val, ctx) => {
        const result = validatePassword(val);
        if (!result.valid) {
          ctx.addIssue({ code: "custom", message: result.errors[0] });
        }
      }),
      confirmPassword:
        action === ManualAuthAction.REGISTER
          ? z.string()
          : z.string().optional(),
      firstName:
        action === ManualAuthAction.REGISTER
          ? z.string().min(1, "Required")
          : z.string().optional(),
      lastName:
        action === ManualAuthAction.REGISTER
          ? z.string().min(1, "Required")
          : z.string().optional(),
    })
    .refine(
      (data) =>
        action !== ManualAuthAction.REGISTER ||
        data.password === data.confirmPassword,
      {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      },
    );

  const {
    handleSubmit,
    formState: { errors },
    control,
    setError,
    watch,
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      confirmPassword: "",
    },
  });

  const [email, password, firstName, lastName, confirmPassword] = watch([
    "email",
    "password",
    "firstName",
    "lastName",
    "confirmPassword",
  ]);
  const isSubmitDisabled = !isRegister
    ? !email || !password
    : !email || !password || !firstName || !lastName || !confirmPassword;

  const handleManualSignin = async (data: z.infer<typeof formSchema>) => {
    if (!isRegister) {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("root", {
          message: "No account found. Please sign up first.",
        });
      } else {
        router.push("/");
      }
    } else {
      const result = await signUp(
        data.email!,
        data.password,
        data.firstName!,
        data.lastName!,
      );

      if (!result?.success) {
        setError("root", {
          message: result?.error,
        });
      } else {
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        if (signInResult?.error) {
          setError("root", {
            message:
              "Account created but sign in failed. Please sign in manually.",
          });
        } else {
          router.push("/");
        }
      }
    }
  };

  const handleOnActionChange = (action: ManualAuthAction) => {
    reset();
    onAuthActionChange(action);
  };

  return (
    <form onSubmit={handleSubmit(handleManualSignin)} id="manual-signin">
      <FieldGroup>
        {isRegister && (
          <>
            <div className="text-2xl">Register</div>
            <Controller
              name="firstName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="relative">
                  <FieldLabel>First Name</FieldLabel>
                  <Input {...field} />
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="absolute -bottom-7 right-0 w-auto!"
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="relative">
                  <FieldLabel>Last Name</FieldLabel>
                  <Input {...field} />
                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className="absolute -bottom-7 right-0 w-auto!"
                    />
                  )}
                </Field>
              )}
            />
          </>
        )}{" "}
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="relative">
              <FieldLabel>Email</FieldLabel>
              <Input {...field} />
              {fieldState.invalid && (
                <FieldError
                  errors={[fieldState.error]}
                  className="absolute -bottom-7 right-0 w-auto!"
                />
              )}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="relative">
              <FieldLabel>Password</FieldLabel>
              <Input {...field} type="password" />
              {fieldState.invalid && (
                <FieldError
                  errors={[fieldState.error]}
                  className="absolute -bottom-7 right-0 w-auto!"
                />
              )}
            </Field>
          )}
        />
        {isRegister && (
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="relative">
                <FieldLabel>Confirm Password</FieldLabel>
                <Input {...field} type="password" />
                {fieldState.invalid && (
                  <FieldError
                    errors={[fieldState.error]}
                    className="absolute -bottom-7 right-0 w-auto!"
                  />
                )}
              </Field>
            )}
          />
        )}
        {errors.root && <FieldError errors={[errors.root]} />}
        <div className="flex gap-2">
          {action === ManualAuthAction.REGISTER && (
            <Button
              className="flex-1"
              type="button"
              variant="secondary"
              onClick={() => handleOnActionChange(ManualAuthAction.SIGNIN)}
            >
              Back
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isSubmitDisabled}>
            {isRegister ? "Create" : "Login"}
          </Button>
          {!isRegister && (
            <Button
              className="flex-1"
              type="button"
              variant="outline"
              onClick={() => handleOnActionChange(ManualAuthAction.REGISTER)}
            >
              Register
            </Button>
          )}
        </div>
      </FieldGroup>
    </form>
  );
};
