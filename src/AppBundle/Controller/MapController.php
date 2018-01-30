<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Form\MapType;
use AppBundle\Entity\Map;
use AppBundle\Service\FileUploader;

class MapController extends Controller {

   
    /**
     * @Route("/full_map", name="full_map")
     */
    public function fullMapGenerator(Request $request, FileUploader $fileUploader) {
        
        
    }
    

    /**
     * @Route("/edit_map/", name="edit_map")
     */
    public function editMapAction(Request $request, FileUploader $fileUploader) {

        $map_id = $request->query->get('idmap');
        if(!$map_id)exit('erreur id map');
        
        
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();
        
        $map = $em->getRepository('AppBundle:Map')->findOneById($map_id);
        if(!$map)exit('erreur map');
        
        if($user->getX() != $map->getX() || $user->getY() != $map->getY())
        {
            exit('no there bro');
        }
        
        if($map->getUser() != null && $map->getUser()!=$user)
        {
            exit('ne vous appartient pas');
        }
        
        $form = $this->createForm(MapType::class, $map);

        if ($request->isMethod('POST')) {
            $form->submit($request->request->get($form->getName()), null);
            if ($form->isSubmitted() && $form->isValid()) {

                $newfile = $request->request->get('appbundle_map');
                $newfile = $newfile['file'];
                /* upload part */
                if ($newfile) {

                    $img = str_replace('data:image/png;base64,', '', $newfile);
                    $img = str_replace(' ', '+', $img);
                    $fileData = base64_decode($img);
                    $fileName = 'map-' . $map->getId();
                    $path = realpath($this->get('kernel')->getRootDir()) . '/../web/uploads/map/' . $fileName . '.png';
                    $map->setFile($fileName . '.png');
                    file_put_contents($path, $fileData);
                }
                $map->setUser($user);
                $em->persist($map);
                $em->flush();
                return $this->redirect($this->generateUrl('homepage',array('updatemap'=>1)));
            }
        }
        return $this->render('map/edit.html.twig', [
                    'mapForm' => $form->createView(),
                    'user' => $user = $this->getUser(),
                    'map' => $map,
                    'images_folder'=>Map::IMAGES_FOLDER,
        ]);
    }

}
