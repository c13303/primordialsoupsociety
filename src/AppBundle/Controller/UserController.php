<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Form\UserType;
use AppBundle\Entity\User;
use AppBundle\Service\FileUploader;



class UserController extends Controller {

    /**
     * @Route("/edit_user/{user}", name="edit_user")
     */
    public function editUserAction(Request $request, User $user, FileUploader $fileUploader) {

        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();
        $form = $this->createForm(UserType::class, $user);

        if ($request->isMethod('POST')) {
            $form->submit($request->request->get($form->getName()), null);
            if ($form->isSubmitted() && $form->isValid()) {

                $newfile = $request->request->get('appbundle_user');
                $newfile = $newfile['file'];

                /* upload part */
                if ($newfile) {

                    $img = str_replace('data:image/png;base64,', '', $newfile);
                    $img = str_replace(' ', '+', $img);
                    $fileData = base64_decode($img);
                    $fileName = 'user-' . $user->getId();
                    $path = realpath($this->get('kernel')->getRootDir()) . '/../web/uploads/users/' . $fileName . '.png';
                    $user->setFile($fileName . '.png');
                    file_put_contents($path, $fileData);
                }

                $em->persist($user);
                $em->flush();
                return $this->redirect($this->generateUrl('homepage'));
            }
        }
        return $this->render('user/edit.html.twig', [
                    'userForm' => $form->createView(),
                    'user' => $user,
                    'images_folder' => User::IMAGES_FOLDER,
        ]);
    }

    /**
     * @Route("/convertusercolor/{user}", name="convert_user_color")
     * @ParamConverter("user", class="AppBundle:User")
     */
    public function convertUserColor(Request $request, User $user) {
        $path = realpath($this->get('kernel')->getRootDir()) . '/../web/uploads/users/';
        $user->convertUserColor($path,255,0,0);
        die('ok');
        return('ok');
    }
}
