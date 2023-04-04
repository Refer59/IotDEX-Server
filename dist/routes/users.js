import express from "express";
import { passwordConfirmation, signIn, forgotPassword, resetPassword, protectRoute, updatePassword, signUpConfirmation, getAuthDataByAuth, checkUserCreationToken, checkUserResetToken, signOut } from "../controllers/auth.js";
import userController, { createUser, deleteAuthUser, deleteUser, getAllUsers, updateAuthUserPassword } from "../controllers/users.js";
const usersRouter = () => {
    const { getUser, updateUser } = userController();
    const usersRouter = express.Router();
    //Deprecado
    //usersRouter.post('/signUp', passwordConfirmation, signUp)
    /* 1) Checa si el param de la pagina password_creation de frontend tiene un token correcto
       2) Con el userID que obtuvo del endpoint de 1) + la password que haya tecleado el usuario activan la cuenta que les creo el admin
          para que ya la puedan usar
    */
    usersRouter.get('/checkUserCreationToken/:token', checkUserCreationToken);
    usersRouter.patch('/signUp/:userId', passwordConfirmation, signUpConfirmation);
    //
    usersRouter.post('/signIn', signIn);
    usersRouter.get('/getAuthDataByToken', protectRoute([]), getAuthDataByAuth);
    usersRouter.get('/signOut', protectRoute([]), signOut);
    //Contraseña olvidada
    usersRouter.post('/forgotPassword', forgotPassword);
    usersRouter.get('/checkUserResetToken/:token', checkUserResetToken);
    usersRouter.patch('/resetPassword/:userId', passwordConfirmation, resetPassword);
    //El usuario actualiza su contraseña desde la pagina, El usuario actualiza su informacion (Excepto la contraseña)
    usersRouter.patch('/updatePassword', protectRoute([]), updatePassword);
    usersRouter.patch('/updateAuthUser', protectRoute([]), updateAuthUserPassword);
    //El usuario Elimina su propia cuenta
    usersRouter.delete('/deleteAuthUser', protectRoute([]), deleteAuthUser);
    usersRouter.route('')
        .get(protectRoute(['ADMIN']), getAllUsers)
        .post(protectRoute(['ADMIN']), createUser);
    usersRouter.route('/:id')
        .get(getUser)
        .patch(updateUser)
        .delete(protectRoute(['ADMIN']), deleteUser);
    return usersRouter;
};
export default usersRouter;
//# sourceMappingURL=users.js.map