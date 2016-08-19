var SYSA = {};

SYSA.SelectedCharacter = 0;
SYSA.SelectedWorld = 0;
SYSA.SelectedLevel = 0;

SYSA.Points = [0,0,0,0,0];
SYSA.Bonus = 0;

SYSA.ResetPoints = function() {
	SYSA.Points = [0,0,0,0,0];
	SYSA.Bonus = 0;
};

var b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2Fixture = Box2D.Dynamics.b2Fixture
    , b2World = Box2D.Dynamics.b2World
    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    , b2ContactListener = Box2D.Dynamics.b2ContactListener
    , b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
