#include <v8.h>
#include <node.h>
#include <node_version.h>
#include <hiredis/hiredis.h>

namespace hiredis {

using namespace v8;
using namespace node;

class Reader : ObjectWrap {
public:
    Reader(bool);
    ~Reader();

    static void Initialize(Handle<Object> target);
    static Handle<Value> New(const Arguments& args);
    static Handle<Value> Feed(const Arguments &args);
    static Handle<Value> Get(const Arguments &args);

    /* Objects created by the reply object functions need to get back to the
     * reader when the reply is requested via Reader::Get(). Keep temporary
     * objects in this handle. Use an array of handles because replies may
     * include nested multi bulks and child-elements need to be added to the
     * right respective parent. handle[0] will be unused, so the real index of
     * an object in this array can be returned from the reply object functions.
     * The returned value needs to be non-zero to distinguish complete replies
     * from incomplete replies. These are persistent handles because
     * Reader::Get might not return a full reply and the objects need to be
     * kept around for subsequent calls. */
    Persistent<Value> handle[9];

    /* Helper function to create string/buffer objects. */
    Local<Value> createString(char *str, size_t len);

private:
    redisReader *reader;

    /* Determines whether to return strings or buffers for single line and bulk
     * replies. This defaults to false, so strings are returned by default. */
    bool return_buffers;

    /* Use a buffer pool like the fast buffers. */
    Local<Value> createBufferFromPool(char *str, size_t len);
    Persistent<Function> buffer_fn;
    Persistent<Object> buffer_pool;
    size_t buffer_pool_length;
    size_t buffer_pool_offset;
};

};

