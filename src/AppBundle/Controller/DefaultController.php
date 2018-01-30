<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Form\CardType;
use AppBundle\Entity\Card;
use AppBundle\Entity\Deck;
use AppBundle\Entity\Map;
use AppBundle\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request)
    {
        $user = $this->getUser();
        $info = 'Bienvenues';
        $token = null;
        $ip = filter_input(INPUT_SERVER,'REMOTE_ADDR',FILTER_VALIDATE_IP);
        $em = $this->getDoctrine()->getManager();
        $mains=null;
        $updatemap=null;
        $map = null;
       
        if($user)
        {
            $map = $em->getRepository('AppBundle:Map')->findOneBy(array('x'=>$user->getX(),'y'=>$user->getY()));
            if(!$map)
            {
                $map = new Map();
                $map->setX($user->getX());
                $map->setY($user->getY());
                $map->setUser($user);
                $map->setName('Nouveau lieu');
                $map->setDescription('Vous êtes dans un lieu vide.');
                $em->persist($map);
                $em->flush();
            }
            
            
            
             $info = 'Connexion au serveur ...';
            if(!$user->getLevel()) // initialisation player
            {
                $user->Init();
                $em->persist($user);   
                $em->flush();
                 return $this->redirect($this->generateUrl('edit_user',array('user'=>$user->getId())));
                 
                
            }
            
           
            
            $mains = $em->getRepository('AppBundle:Deck')->findByUser($user);
            if(!$mains)
            {               
                $mains=array();
                for($i=0; $i<Deck::NB_CARDS;$i++)
                {  
                   $card = $em->getRepository('AppBundle:Card')->getRandom();                  
                   $main = new Deck(); // initialisation deck
                   $main->setUser($user); 
                   $main->setCard($card);
                   $main->setHandPosition(0);
                   $em->persist($main);
                   $em->flush();   
                   $mains[]=$main;
                }          
            }
            
            
            
            
            $length = 30;
            $token = substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
            $user->setIp($ip);
            $user->setToken($token);
            $em->persist($user);
            $em->flush();
            
            $updatemap = $request->query->get('updatemap');
            
        }
        
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
            'info'=>$info,
            'user'=>$user,
            'token'=>$token,
            'deck'=>$mains,
            'images_folder'=>Map::IMAGES_FOLDER,
            'user_folder'=>User::IMAGES_FOLDER,
            'map'=>$map,
            'updatemap'=>$updatemap
        ]);
    }
    
    /**
     * @Route("/admin", name="admin")
     */
    public function adminAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        
        
        
        $allcards = $em->getRepository('AppBundle:Card')->findAll();
        
        $user = $this->getUser();
        $userManager = $this->get('fos_user.user_manager');
        $users = $userManager->findUsers();
        return $this->render('admin/admin.html.twig', [
            'user' => $user,
            'users' => $users,
            'cards'=>$allcards
        ]);
    }
}
