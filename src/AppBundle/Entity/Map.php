<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Map
 *
 * @ORM\Table(name="map")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\MapRepository")
 */
class Map {
    
    CONST IMAGES_FOLDER = '/uploads/map/';
    CONST MAX_X = 100;
    CONST MAX_Y = 100;
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var int
     *
     * @ORM\Column(name="X", type="integer")
     */
    private $x;

    /**
     * @var int
     *
     * @ORM\Column(name="Y", type="integer")
     */
    private $y;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255,nullable=true)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="description", type="string", length=800,nullable=true)
     */
    private $description;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\User")
     * @ORM\JoinColumn(nullable=true)
     */
    private $user;

    /**
     * @ORM\Column(type="string",nullable=true)  
     */
    private $file;
    
    
    /**
     * @var int
     *
     * @ORM\Column(name="popularity", type="integer",nullable=true)
     */
    private $popularity;
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    /**
     * Get id
     *
     * @return int
     */
    
    public function getId() {
        return $this->id;
    }

    /**
     * Set x
     *
     * @param integer $x
     *
     * @return Map
     */
    public function setX($x) {
        $this->x = $x;

        return $this;
    }

    /**
     * Get x
     *
     * @return int
     */
    public function getX() {
        return $this->x;
    }

    /**
     * Set y
     *
     * @param integer $y
     *
     * @return Map
     */
    public function setY($y) {
        $this->y = $y;

        return $this;
    }

    /**
     * Get y
     *
     * @return int
     */
    public function getY() {
        return $this->y;
    }

    /**
     * Set name
     *
     * @param string $name
     *
     * @return Map
     */
    public function setName($name) {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return Map
     */
    public function setDescription($description) {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * Set user
     *
     * @param integer $user
     *
     * @return Map
     */
    public function setUser($user) {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return int
     */
    public function getUser() {
        return $this->user;
    }

    /**
     * Sets file.
     *
     * @param string $file
     */
    public function setFile($file = null) {
        $this->file = $file;
    }

    /**
     * Get file.
     *
     * @return string
     */
    public function getFile() {
        return $this->file;
    }
    
    
    /**
     * Sets popularity.
     *
     * @param int $popularity
     */
    public function setPopularity($popularity = null) {
        $this->popularity = $popularity;
    }

    /**
     * Get popularity.
     *
     * @return int
     */
    public function getPopularity() {
        return $this->popularity;
    }

}
