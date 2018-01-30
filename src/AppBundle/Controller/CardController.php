<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Form\CardType;
use AppBundle\Entity\Card;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class CardController extends Controller {

    /**
     * @Route("/add_card", name="add_card")
     * Security("has_role('ROLE_SUPER_ADMIN')")
     */
    public function addCardAction(Request $request) {
        $em = $this->getDoctrine()->getManager();
        $user = $this->getUser();
        $card = new Card();
        $form = $this->createForm(CardType::class, $card);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            $em->persist($card);
            $em->flush();
            return $this->redirectToRoute('admin');
        }

        return $this->render('card/edit.html.twig', [
                    'cardForm' => $form->createView(),
                    'user' => $user,
                    'card' => $card,            
                    'images_folder'=>Card::IMAGES_FOLDER,
        ]);
    }

    /**
     * @Route("/edit_card/{card}", name="edit_card")
     * @ParamConverter("card", class="AppBundle:Card")
     */
    public function editCardAction(Request $request, Card $card) {
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();
        $form = $this->createForm(CardType::class, $card);
       //$form->handleRequest($request);
        if ($request->isMethod('POST')) {
            $form->submit($request->request->get($form->getName()), null);
            if ($form->isSubmitted() && $form->isValid()) {

                $newfile = $request->request->get('appbundle_card');
                $newfile = $newfile['file'];
                /* upload part */
                if ($newfile) {
                    
                    $img = str_replace('data:image/png;base64,', '', $newfile);
                    $img = str_replace(' ', '+', $img);
                    $fileData = base64_decode($img);
                    $fileName = 'card-' . $card->getId();
                    $path = realpath($this->get('kernel')->getRootDir()) . '/../web/uploads/cards/' . $fileName . '.png';
                    $card->setFile($fileName . '.png');
                    file_put_contents($path, $fileData);
                }

                $card->calculateValue();

                $em->persist($card);
                $em->flush();
                return $this->redirectToRoute('admin');
            }
        }
        return $this->render('card/edit.html.twig', [
                    'card'=>$card,
                    'cardForm' => $form->createView(),
                    'user' => $user = $this->getUser(),
                    'images_folder'=>Card::IMAGES_FOLDER,
        ]);
    }
    
    /**
     * @Route("/craft", name="craft")
     */
    public function craftCardAction(Request $request) {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();
        $card_id = $request->request->get('idcard'); // edit mode
        if($card_id){
            $card = $em->getRepository('AppBundle:Card')->findOneById($card_id);
        }else{
            $card = new Card();
        }
        
        
       $form = $this->createForm(CardType::class, $card);

        if ($request->isMethod('POST')) {
            $form->submit($request->request->get($form->getName()), null);
            if ($form->isSubmitted() && $form->isValid()) {

                $newfile = $request->request->get('appbundle_card');
                $newfile = $newfile['file'];
                /* upload part */
                if ($newfile) {

                    $img = str_replace('data:image/png;base64,', '', $newfile);
                    $img = str_replace(' ', '+', $img);
                    $fileData = base64_decode($img);
                    $fileName = 'card-' . $card->getId();
                    $path = realpath($this->get('kernel')->getRootDir()) . '/../web/uploads/card/' . $fileName . '.png';
                    $card->setFile($fileName . '.png');
                    file_put_contents($path, $fileData);
                }
                $card->setUser($user);
                $em->persist($card);
                $em->flush();
                return $this->redirect($this->generateUrl('homepage',array('updatecard'=>1)));
            }
        }
        return $this->render('card/craft.html.twig', [
                    'cardForm' => $form->createView(),
                    'user' => $user = $this->getUser(),
                    'images_folder' => Card::IMAGES_FOLDER,
                    'card' => $card
        ]);
    }
    

}
