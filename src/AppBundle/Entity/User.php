<?php
// src/AppBundle/Entity/User.php

namespace AppBundle\Entity;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="fos_user")
 */
class User extends BaseUser
{
    
    CONST IMAGES_FOLDER = '/uploads/users/';
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;
    
    /**
     * @var int
     *
     * @ORM\Column(name="x", type="integer", nullable=true)
     */
    private $x;
    
    /**
     * @var int
     *
     * @ORM\Column(name="y", type="integer", nullable=true)
     */
    private $y;
    
    /**
     * @var int
     *
     * @ORM\Column(name="score", type="integer", nullable=true)
     */
    private $score;
    
    
    /**
     * @var int
     *
     * @ORM\Column(name="money", type="integer", nullable=true)
     */
    private $money;
    
    /**
     * @var int
     *
     * @ORM\Column(name="life", type="integer", nullable=true)
     */
    private $life;
    
    /**
     * @var int
     *
     * @ORM\Column(name="karma", type="integer", nullable=true)
     */
    private $karma;
    
    /**
     * @var int
     *
     * @ORM\Column(name="sex", type="integer", nullable=true)
     */
    private $sex;
    
    /**
     * @var int
     *
     * @ORM\Column(name="sanity", type="integer", nullable=true)
     */
    private $sanity;
    
    
    /**
     * @var boolean
     *
     * @ORM\Column(name="AI", type="boolean")
     */
    private $AI=0;
    
    
    /**
     * @var string
     *
     * @ORM\Column(name="file", type="string", length=255,nullable=true)
     */
    private $file;
    
    
    /**
     * @var string
     *
     * @ORM\Column(name="role", type="string", length=255,nullable=true)
     */
    private $role;
    
        
    /**
     * @var int
     *
     * @ORM\Column(name="level", type="integer", nullable=true)
     */
    private $level;
    
    /**
     * @var int
     *
     * @ORM\Column(name="rank", type="integer", nullable=true)
     */
    private $rank;
    
    /**
     * @var string
     *
     * @ORM\Column(name="speak", type="text", length=65535,nullable=true)
     */
    private $speak;

    
    /**
     * @var string
     *
     * @ORM\Column(name="token", type="string", length=255,nullable=true)
     */
    private $token;
    
    
    /**
     * @var string
     *
     * @ORM\Column(name="ip", type="string", length=255,nullable=true)
     */
    private $ip;
    
    
    
    /**
     * @var string
     *
     * @ORM\Column(name="sessiondata", type="text", length=65635,nullable=true)
     */
    private $sesiondata;
    
    
    /**
     * @var int
     *
     * @ORM\Column(name="popularity", type="integer",nullable=true)
     */
    private $popularity;
    
    
     /**
     * @var int
     *
     * @ORM\Column(name="creator_id", type="integer",nullable=true)
     */
    private $creator_id;
    
    
    
    
    
    
    

    public function __construct()
    {
        parent::__construct();
        // your own logic
    }

    /**
     * Set x
     *
     * @param integer $x
     *
     * @return User
     */
    public function setX($x)
    {
        $this->x = $x;

        return $this;
    }

    /**
     * Get x
     *
     * @return integer
     */
    public function getX()
    {
        return $this->x;
    }

    /**
     * Set y
     *
     * @param integer $y
     *
     * @return User
     */
    public function setY($y)
    {
        $this->y = $y;

        return $this;
    }

    /**
     * Get y
     *
     * @return integer
     */
    public function getY()
    {
        return $this->y;
    }

    /**
     * Set score
     *
     * @param integer $score
     *
     * @return User
     */
    public function setScore($score)
    {
        $this->score = $score;

        return $this;
    }

    /**
     * Get score
     *
     * @return integer
     */
    public function getScore()
    {
        return $this->score;
    }

    /**
     * Set money
     *
     * @param integer $money
     *
     * @return User
     */
    public function setMoney($money)
    {
        $this->money = $money;

        return $this;
    }

    /**
     * Get money
     *
     * @return integer
     */
    public function getMoney()
    {
        return $this->money;
    }

    /**
     * Set life
     *
     * @param integer $life
     *
     * @return User
     */
    public function setLife($life)
    {
        $this->life = $life;

        return $this;
    }

    /**
     * Get life
     *
     * @return integer
     */
    public function getLife()
    {
        return $this->life;
    }

    /**
     * Set karma
     *
     * @param integer $karma
     *
     * @return User
     */
    public function setKarma($karma)
    {
        $this->karma = $karma;

        return $this;
    }

    /**
     * Get karma
     *
     * @return integer
     */
    public function getKarma()
    {
        return $this->karma;
    }

    /**
     * Set sex
     *
     * @param integer $sex
     *
     * @return User
     */
    public function setSex($sex)
    {
        $this->sex = $sex;

        return $this;
    }

    /**
     * Get sex
     *
     * @return integer
     */
    public function getSex()
    {
        return $this->sex;
    }

    /**
     * Set sanity
     *
     * @param integer $sanity
     *
     * @return User
     */
    public function setSanity($sanity)
    {
        $this->sanity = $sanity;

        return $this;
    }

    /**
     * Get sanity
     *
     * @return integer
     */
    public function getSanity()
    {
        return $this->sanity;
    }

    /**
     * Set aI
     *
     * @param boolean $aI
     *
     * @return User
     */
    public function setAI($aI)
    {
        $this->AI = $aI;

        return $this;
    }

    /**
     * Get aI
     *
     * @return boolean
     */
    public function getAI()
    {
        return $this->AI;
    }

    /**
     * Set file
     *
     * @param string $file
     *
     * @return User
     */
    public function setFile($file)
    {
        $this->file = $file;

    }

    /**
     * Get file
     *
     * @return string
     */
    public function getFile()
    {
        return $this->file;
    }

    /**
     * Set role
     *
     * @param string $role
     *
     * @return User
     */
    public function setRole($role)
    {
        $this->role = $role;

        return $this;
    }

    /**
     * Get role
     *
     * @return string
     */
    public function getRole()
    {
        return $this->role;
    }

    /**
     * Set level
     *
     * @param integer $level
     *
     * @return User
     */
    public function setLevel($level)
    {
        $this->level = $level;

        return $this;
    }

    /**
     * Get level
     *
     * @return integer
     */
    public function getLevel()
    {
        return $this->level;
    }

    /**
     * Set rank
     *
     * @param integer $rank
     *
     * @return User
     */
    public function setRank($rank)
    {
        $this->rank = $rank;

        return $this;
    }

    /**
     * Get rank
     *
     * @return integer
     */
    public function getRank()
    {
        return $this->rank;
    }

    /**
     * Set speak
     *
     * @param string $speak
     *
     * @return User
     */
    public function setSpeak($speak)
    {
        $this->speak = $speak;

        return $this;
    }

    /**
     * Get speak
     *
     * @return string
     */
    public function getSpeak()
    {
        return $this->speak;
    }

    /**
     * Set token
     *
     * @param string $token
     *
     * @return User
     */
    public function setToken($token)
    {
        $this->token = $token;

        return $this;
    }

    /**
     * Get token
     *
     * @return string
     */
    public function getToken()
    {
        return $this->token;
    }
    
    
    
    /**
     * Set sessiondata
     *
     * @param string $sessiondata
     *
     * @return User
     */
    public function setSessiondata($sessiondata)
    {
        $this->sessiondata = $sessiondata;

        return $this;
    }

    /**
     * Get sessiondata
     *
     * @return string
     */
    public function getSessiondata()
    {
        return $this->sessiondata;
    }
    
    
    
    /**
     * Set ip
     *
     * @param string $ip
     *
     * @return User
     */
    public function setIp($ip)
    {
        $this->ip = $ip;

        return $this;
    }

    /**
     * Get ip
     *
     * @return string
     */
    public function getIp()
    {
        return $this->ip;
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
    
    /**
     * Sets creator_id.
     *
     * @param int $creator_id
     */
    public function setCreator_id($creator_id = null) {
        $this->creator_id = $creator_id;
    }

    /**
     * Get creator_id.
     *
     * @return int
     */
    public function getCreator_id() {
        return $this->creator_id;
    }
    
    
    
    public function Init()
    {
        $this->x = 0;
        $this->y = 0;
        $this->level = 1;
        $this->money = 100;
        $this->karma = 0;
        $this->sex = 0;
        $this->sanity = 0;
        $this->score = 0;
        $this->speak = "Je suis nouveau ...";
        $this->life = 100;
        $this->file = "bolos.png";    
        
        
    }
    
    public function convertUserColor($path,$r=0,$g=0,$b=0) {
        
        $filename = $this->file;
        $source = $path.$filename;   
        $target = $path.'lvl-'.$filename;
        $r = 255-$r; $g=255-$g; $b=255-$b;
        $im = imagecreatefrompng($source);
        imagefilter($im,IMG_FILTER_NEGATE);
        imagefilter($im, IMG_FILTER_COLORIZE, $r, $g, $b); 
        imagefilter($im,IMG_FILTER_NEGATE);
        imagealphablending($im, false);
        imagesavealpha($im, true);
        imagepng($im,$target);
        imagedestroy($im);
        echo $source;
       
    }
}
